import AWS from 'aws-sdk'

export class S3Client {
  protected client: AWS.S3

  constructor() {
    this.client = new AWS.S3()
  }

  public async getObject(
    location: string,
    filename: string,
  ): Promise<AWS.S3.Types.GetObjectOutput> {

    const request: AWS.S3.Types.GetObjectRequest = {
      Bucket: location,
      Key: filename,
    }
    
    return new Promise((resolve, reject) => {
      this.client.getObject(request, (error, data) => {
        if (error) {
          return reject(error)
        }

        return resolve(data)
      })
    })
  }

}
