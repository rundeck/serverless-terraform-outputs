
const TF_PREFIX = 'terraform:'
const PLUGIN_NAME = 'serverless-terraform-outputs'

import {TFOutputs, TFWorkspace, S3_PREFIX} from './terraform'
import { worker } from 'cluster'
import { stringify } from 'querystring'


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
        const i = variable.lastIndexOf(':')
        const workspace = variable.substr(0, i)
        const path = variable.substr(i+ 1, variable.length)
       
        const outputs = await TFWorkspace.Load(workspace, this.serverless)

        const value = outputs.getValueAtPath(path)

        return value
    }
}

export = ServerlessTerraformOpts