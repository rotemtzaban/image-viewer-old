import { PNG } from 'pngjs';
import fs from 'fs';
const png = new PNG({ bitDepth: 16 });
global.process.stdin.resume();
let x = PNG.sync.read(
    fs.readFileSync(
        'C:\\Users\\rotem\\source\\repos\\PngCreator\\PngCreator\\Output\\first.png'
    )
);

console.log(x.data.byteLength);
// png.addListener('parsed', () => {
//     console.log(png.data.length)
//     global.process.stdin.pause();
// })
// fs.createReadStream("C:\\Users\\rotem\\source\\repos\\PngCreator\\PngCreator\\Output\\first.png").pipe(png);
// class Video extends HTMLVideoElement {
//     constructor() {
//         super();
//         const video = document.createElement('video');
//         for (const key of (Object.getOwnPropertyNames(video) as Array<string | symbol>).concat(Object.getOwnPropertySymbols(video))) {
//             let descriptor = Reflect.getOwnPropertyDescriptor(HTMLVideoElement.prototype, key);
//             if (descriptor.writable) {
//                 const element = video[key];
//                 this[key] = element;
//             }
//         }
//     }
// }
function Video(this:HTMLVideoElement, width?:number, height?:number){
    if(!(this instanceof HTMLVideoElement)){
        throw new Error("Video should be used with the new keyword");
    }

    const video = document.createElement('video');
    if(typeof width !== 'undefined'){
        video.width = width;
    }
    if(typeof height !== 'undefined'){
        video.height = height;
    }

    return video;
}

Video.prototype = HTMLVideoElement.prototype;

// class Video extends HTMLVideoElement{
//     constructor(width, height){
//         super();
//         const video = document.createElement('video');
//         if(typeof width !== 'undefined'){
//             video.width = width;
//         }
//         if(typeof height !== 'undefined'){
//             video.height = height;
//         }

//         return video;
//     }
// }
// customElements.define('my-video', Video, { extends: 'video' });
// function Video(this: HTMLVideoElement) {
//     const video = document.createElement('video');
//     for (const key in video) {
//         const element = video[key];
//         this[key] = element;
//     }
// }

// Video.prototype = HTMLVideoElement.prototype;
