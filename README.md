serverless-terraform-outputs
============================

Provides variable substitution resolution from Terraform outputs with workspace support:
```
${terraform:app-stage:sqs_queue_stuff.value.arn}
```
# Usage
```yaml
custom:
    stage: ${opt:stage, self:provider.stage}
    tf_workspace: ${self:custom.stage}

provider:
    environment:
        SQS_QUEUE: ${terraform:${self:custom.tf_workspace}:sqs_queue_stuff.value.url}
```

## Prerequisites
Requires Terraform to be installed and accessible via the path, as well as minimal backend config:
`main.tf`:
```
terraform {
    required_version = "0.11.8"
    backend "s3" {
        region               = "us-west-2"
        key                  = "project/foo"
        bucket               = "foosoft-terraform"
    }
}
```

For outputs from multiple Terraform configurations it is recommended to set them up as data sources
and re-export the required vars.

## Configuration

Optionally, you can configure the plugin:

```
custom:
    terraformOutputs:
        cwd: dir/with/terraform/files
```

| Parameter Name | Default Value | Description |
| --- | --- | --- |
| cwd | _(project base dir)_ | The directory where `terraform outputs` will be executed in, relative to the project base directory |
