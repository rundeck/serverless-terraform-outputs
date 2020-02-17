
const TF_PREFIX = 'terraform:'
const PLUGIN_NAME = 'serverless-terraform-outputs'

import {TFOutputs} from './terraform'

class ServerlessTerraformOpts {
    serverless: any
    outputs!: TFOutputs

    constructor(serverless: any) {
        this.serverless = serverless
        const delegate = serverless.variables.getValueFromSource.bind(serverless.variables)

        serverless.variables.getValueFromSource = (variableString: string) => {
            if (variableString.startsWith(TF_PREFIX))
                return this._getValue(variableString.split(TF_PREFIX)[1])
            else
                return delegate(variableString)
        }
    }

    async _getValue(variable: string) {
        const items = variable.split(':')
        const path = items.length > 1 ? items[1] : items[0]
        const workspace = items.length > 1 ? items[0] : undefined
        
        const outputs = await TFOutputs.Load(this.serverless, workspace)

        const value = outputs.getValueAtPath(path)

        return value
    }
}

export = ServerlessTerraformOpts