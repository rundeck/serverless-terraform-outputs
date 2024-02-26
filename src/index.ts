
const TF_PREFIX = 'terraform:'
const PLUGIN_NAME = 'serverless-terraform-outputs'

import {TFOutputs} from './terraform'

class ServerlessTerraformOpts {
    serverless: any
    configurationVariablesSources: any
    outputs!: TFOutputs

    constructor(serverless: any) {
        this.serverless = serverless
        
        this.configurationVariablesSources = {
            terraform: {
              async resolve({ address }: any) {                
                const [workspace, path] = address.split(':');
                const outputs = await TFOutputs.Load(workspace, serverless);
                const value = outputs.getValueAtPath(path);

                return {
                  //
                  value: value,
                };
              },
          },
        };
    }
}

export = ServerlessTerraformOpts