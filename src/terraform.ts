import {exec} from './async'


export async function output(workspace: string): Promise<any> {
    const res = await exec('terraform output -json', {env: {...process.env, TF_WORKSPACE: workspace}})
    return JSON.parse(res.stdout)
}

export class TFOutputs {
    static resp: Promise<any>

    constructor(readonly outputs: any, readonly serverless: any) {}

    /**
     * Use Terraform command to fetch outputs and construct TFOutputs instance.
     * @param workspace Name of Terraform workspace to use
     */
    static async Load(workspace: string, serverless: any) {
        if(!this.resp)
            this.resp = output(workspace)
        const outputs = await this.resp
        return new TFOutputs(outputs, serverless)
    }

    getValueAtPath(path: string) {
        const pathParts = path.split('.')
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
            `terraform-serverless-outputs: Outputs property <${part}> not found in path <${path}>. `,
            `Check Terraform outputs and verify property is present.`
        ].join('')
        throw new this.serverless.classes.Error(errorMessage)
    }
}
