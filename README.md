# n8n-designpatterns

## Configuring esbuild

### esbuild doesn't generate typescript declarations
- https://github.com/evanw/esbuild/issues/95
- https://medium.com/geekculture/build-a-library-with-esbuild-23235712f3c#:~:text=esbuild%20not%20generating%20the%20declarations

## Development and Making Changes

When you working on n8n-designpatterns and want to make changes, it would be usefull to check these changes with some existing Node project. During development process Use local n8n-designpatterns package At Node repo, where you want to check new features of designpatterns:

    # use local n8n-designpatterns
    npm uninstsall n8n-designpatterns
    npm i -S /local/path/to/n8n-designpatterns/repo

That way you can add new features to n8n-designpatterns and check & use them with real n8n Node project. 

## Release a New Version

Run `./release.sh <ver>`, for example `./release.sh 0.1.2`.