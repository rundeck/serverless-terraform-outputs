#  Changelog

# 0.0.5 (dev)

- add dependency on "aws-sdk"
- add aws client to retreive shared terraform state stored on S3 without need of tf config.
- introduce TFWorkspace to load several workspace
- rename output to load_output in terraform js (avoid confusion of stored result)
- if not specified, retreive last 'value' member of key path in terraform state
- if not specified, retreive first 'outputs' member of key path in terraform state

# 0.0.4

- all previous work from Rundesk