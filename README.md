# ThreeJS - Typescript Template
ThreeJS TypeScript

### Features:
- **Custom shader support:** Simply save your shader files as `.glsl`, `.vs`, or `.fs` then use in TypeScript with `import shader from "./path/fileName.glsl";`
- **Hot-reloading:** Automatic browser refresh and reload when TypeScript or Shader file changes. (Does not work with `.html` file changes.)
- **Path aliases:** to avoid relative path hell. Turns `../../../utils/` into `Utils/`. 
To add more aliases: 
    1. Add another item under "paths" in `tsconfig.json` so TypeScript finds the module.
    2. Also add it under "alias" in `webpack.config.js` so Webpack finds it too.
- **Multiple-devices:** Any device in the same network can access the dev code and gets hot-reloaded when the code changes. 
Simply find the local IP address of the dev machine, and point your testing devices to that address. For example: http://192.168.xx.xx:8000/web

### How to run?
1. Make sure you have [Node.js](https://nodejs.org/en/) installed
2. Navigate in your terminal to the folder where you've saved this project
3. Type `npm install`
4. Then `npm run`
5. Point your browser to [`http://localhost:8000/web`](http://localhost:8000/web)
6. If you see a cube or torus you are good to go.
