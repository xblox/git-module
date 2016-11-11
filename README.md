# Package to emulate git sub modules

### Installation 

    sudo npm install -g git-module

## Usage

### Prepare

Extend your package.json for the following root entry: 
 
```json

"modules": [
 {
   "name": "server-template",
   "options": {
     "repository": "https://github.com/gbaumgart/xcf-servers.git",
     "recursive": true,
     "directory": "server-template",
     "profile":"control-freak"
   },
   "clone": {
     "post": {
       "command": "git submodule foreach \"git checkout master\""
     }
   }
 }
]
```

### Command **init-modules**


Install git modules as specified in the package.json

    git-module init-modules

This will clone https://github.com/gbaumgart/xcf-servers.git in ./server-template and also checks out sub modules.
 
Options: 

**target**

This option allows you to change current directory for the checked out modules: 

    git-module init-modules --target="./test"
    
**profile**

This option allows you to filter modules against "profile". Extend your module definition as seen above in the example
package.json.

    git-module init-modules --target="./test" --profile="control-freak"

This will only process modules which have a "profile" set to "control-freak"




