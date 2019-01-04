import * as Util from 'util'

import Child from 'child_process'

export const exec = Util.promisify(Child.exec)