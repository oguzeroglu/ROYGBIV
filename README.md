# ROYGBIV

ROYGBIV is a WebGL game engine for motivated programmers who do not have the budget for buying fancy 3D models or licensing a popular engine but still want to make 60 FPS web games for both mobile and desktop. It is being developed by one of such programmers on top of low level THREE.js features for the graphics and CANNON.js for physics. It is named after this [Boards of Canada track](https://www.youtube.com/watch?v=W-GWjzw0GwQ).    

![](/screen_shots/roygbiv.gif?raw=true)   

## Demos    
* [Autonomous Battle](https://oguzeroglu.github.io/kompute-demos-with-roygbiv/autonomousBattle/application.html)    
* [Blaster](https://oguzeroglu.github.io/ROYGBIV/demo/blaster/application.html)    
* [Cooking space kebab with a flamethrower](https://oguzeroglu.github.io/ROYGBIV/demo/spaceKebab/application.html)    
* [Plasma Rifle - Inspired by Doom's Plasma Rifle](https://oguzeroglu.github.io/ROYGBIV/demo/plasmaGun/application.html)    
* [Jump pads - Inspired by Valve's Ricochet](https://oguzeroglu.github.io/ROYGBIV/demo/jumpPads/application.html)    
* [aykir.io (2D) - A Multiplayer Cards Against Humanity clone](https://aykir.io)    
* [Electro shock](https://oguzeroglu.github.io/ROYGBIV/demo/electroShock/application.html)    
* [Shooter](https://oguzeroglu.github.io/ROYGBIV/demo/shooter/application.html)   
* [GPU particles showcase](https://oguzeroglu.github.io/ROYGBIV/demo/psShowcase/application.html)   
* [Online preview of the engine](https://oguzeroglu.github.io/ROYGBIV/roygbiv.html)  

## The current state of the project
ROYGBIV is still under development and not documented yet. Estimated documentation release date is April 2021.    

### Roadmap
- [ ] Integrated AI engine
  - [x] Movement layer
  - [ ] Decision layer
- [ ] Audio support
- [ ] Plugin support
- [ ] Test coverage
- [ ] Documentation

## How to run?

ROYGBIV works on browsers (preferably Chrome or Firefox). It works with a set of commands typed to its command line interface so a documentation will be provided when the project is finished. To install, follow these steps:

* Download or clone the repository.
* If you don't have nodejs/npm download them.
* Go inside the repository (where server.js is), using the command line run **npm install**
* Run **node server** to start the server. You should see something like this:
![](/screen_shots/server.png?raw=true)
* Using your favorite browser, go to page **localhost:8085**

## License

ROYGBIV uses MIT license. See the third_party_licenses folder for licenses of used third party libraries.
