const {formidable} = require('formidable');
const Transform = require('stream').Transform;
const {Upload} = require("@aws-sdk/lib-storage");
const {S3Client} = require("@aws-sdk/client-s3")

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

const parsefile = async (req)=>{
    return new Promise((resolve,reject)=>{
        let options = {
            maxFileSize: 15 *  1024 * 1024,
            allowEmptyFiles: false
        }

        const form = formidable(options);

        form.parse(req, (err, fields, files)=>{
            if (err) {
                next(err);
                return;
              }
        });

        form.on('error', error=>{
            reject(error.message)
        })

        form.on('data', data=>{
            if(data.name === "complete"){
                resolve(data.value);
            }
        })

        form.on('fileBegin', (formName, file)=>{
            file.open = async function(){
                this._writeStream = new Transform({
                    transform(chunk, encoding, callback){
                        callback(null, chunk)
                    }
                })

                this._writeStream.on('error', e=>{
                    form.emit('error', e)
                })

                new Upload({
                    client: new S3Client({
                        credentials:{
                            accessKeyId,
                            secretAccessKey
                        },
                        region
                    }),
        
                    params: {
                        ACL: 'public-read',
                        Bucket,
                        Key: `${Date.now().toString()}-${this.originalFilename}`,
                        Body: this._writeStream
                    },
        
                    tags: [],
                    queueSize: 4,
                    partSize : 1024 * 1024 * 5,
                    leavePartsOnError: false,
                })
                .done()
                .then(data=> {
                    form.emit('data', {name: "complete", value: data})
                })
                .catch((err)=>{
                    form.emit('error', err);
                })
            }

            file.end = function (cb){
                this._writeStream.on('finish', ()=>{
                    this.emit('end')
                    cb()
                })
                this._writeStream.end()
            }
        })



    })
}


module.exports = parsefile;