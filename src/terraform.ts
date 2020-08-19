import {exec} from './async'
import { join } from 'path'
import { S3Client } from './aws-s3-client'

const OUTPUTS_MEMBER = 'outputs'
const VALUE_MEMBER = 'value'
export const TERRAFORM_STATE_FILE = 'terraform.tfstate' 
export const S3_PREFIX = 's3://'

/**
 * Load output of specified terraform workspace.
 * If workspace is a local path then use Terraform command to fetch outputs.
 * If workspace is an s3 path (start with s3://), then use aws s3 client to fetch content.
 * 
 * @param workspace workspace path
 * @param serverless serverless instance
 */
async function load_output(workspace: string, serverless: any): Promise<any> {

    if (workspace.startsWith(S3_PREFIX)) {
        // retreive bucket name (location) and key (filename)
        const bucket_path = workspace.split(S3_PREFIX)[1].split('/')
        const location = bucket_path[0]
        var filename = bucket_path.slice(1).join('/')

        // avoid to specify complete terraform state path
        if (!filename.endsWith(TERRAFORM_STATE_FILE)) {
            filename = `${filename}/${TERRAFORM_STATE_FILE}`
        }

        const s3Response = await new S3Client().getObject(location, filename)
        return s3Response && s3Response.Body ? JSON.parse(s3Response.Body.toString('utf-8')) : {}
    }

    // use Terraform command to fetch outputs
    const pluginOptions = ((serverless.service || {}).custom || {}).terraformOutputs || {}

    const options = {
        cwd: pluginOptions.cwd,
        env: {
            ...process.env,
            TF_WORKSPACE: workspace
        }
    }
    
    const res = await exec('terraform output -json', options)
    return JSON.parse(res.stdout)
}

export class TFWorkspace {
    static states: Map<string, TFOutputs> = new Map()

    /**
     * Ensure that output of specified workspace is loaded
     * @param workspace Name of Terraform workspace to use
     */
    static async Load(workspace: string, serverless: any): Promise<TFOutputs> {
        if (!this.states.has(workspace)) {
            const output = new TFOutputs(workspace, await load_output(workspace, serverless), serverless)
            this.states.set(workspace, output)
        }
        return <TFOutputs> this.states.get(workspace)
    }
}

export class TFOutputs {

    constructor(readonly workspace: string, readonly outputs: any, readonly serverless: any) {}

    getValueAtPath(path: string) {
        var real_path = path

        if (!path.startsWith(OUTPUTS_MEMBER)) {
            real_path = `${OUTPUTS_MEMBER}.${real_path}`
        }
        if (!path.endsWith(VALUE_MEMBER)) {
            real_path = `${real_path}.${VALUE_MEMBER}`
        }

        const pathParts = real_path.split('.')

        let cursor = this.outputs
        for(const part of pathParts) {
            cursor = cursor[part]
            if(cursor == null)
                this.pathError(path, part)
        }
            
        return cursor
    }

    pathError(path: string, part: string) {
        const errorMessage = [
            `terraform-serverless-outputs: Outputs property <${part}> not found in path <${path}>, `,
            `using workspace <${this.workspace}>. `,
            `Check Terraform outputs and verify property is present.`
        ].join('')
        throw new this.serverless.classes.Error(errorMessage)
    }
}
