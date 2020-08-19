# serverless-terraform-outputs

Provides variable substitution resolution from Terraform outputs.

It support terrafrom workspace managed on :
- s3 bucket
- local path using terraform command.


## Usage

### With state stored on s3

```yaml
custom:
    stage: ${opt:stage, self:provider.stage}
    tf_workspace_foo: s3://my-state_bucket/main-account/eu-west-1/foo/${self:custom.stage}
    tf_workspace_bar: s3://my-state_bucket/main-account/eu-west-1/bar/${self:custom.stage}

provider:
    environment:
        SQS_QUEUE: ${terraform:${self:custom.tf_workspace_foo}:sqs_queue_stuff_url}
        ROLE_ARN: ${terraform:${self:custom.tf_workspace_bar}:my_role_arn}
```

Internaly, this plugin will load state from `s3://state_bucket/main-account/eu-west-1/foo/${self:custom.stage}/terraform.tfstate` as specified in custom.tf_workspace_foo, and resolve output `sqs_queue_stuff_url`

As you could see, you can use several terraform workspace, if your resources came from several stack.

### With state stored localy


#### Prerequisites

Requires Terraform to be installed and accessible via the path, as well as minimal backend config:
`main.tf`:
```
terraform {
    required_version = "0.12.26"
    backend "s3" {
        region               = "us-west-2"
        key                  = "project/foo"
        bucket               = "foosoft-terraform"
    }
}
```

For outputs from multiple Terraform configurations it is recommended to set them up as data sources
and re-export the required vars.

#### Example

```yaml
custom:
    stage: ${opt:stage, self:provider.stage}
    tf_workspace: ${self:custom.stage}

provider:
    environment:
        SQS_QUEUE: ${terraform:${self:custom.tf_workspace}:sqs_queue_stuff.value.url}
```

#### Configuration

Optionally, you can configure the plugin:

```
custom:
    terraformOutputs:
        cwd: dir/with/terraform/files
```

| Parameter Name | Default Value | Description |
| --- | --- | --- |
| cwd | _(project base dir)_ | The directory where `terraform outputs` will be executed in, relative to the project base directory |

## Change log

## 0.1.0 (dev)

- add dependency on "aws-sdk" and aws client to retreive shared terraform state stored on S3.
- introduce TFWorkspace to load several workspace
- rename output to load_output in terraform js (avoid confusion of stored result)
- in terraform state file:
    - if not specified, retreive last 'value' member of key path
    - if not specified, retreive first 'outputs' member of key path


### 0.0.4

All previous work from Rundesk:
- initial project tree using typescript
- serverless plugin declaration
- use of local terraform command to load output
