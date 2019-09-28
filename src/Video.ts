function Video(this: HTMLVideoElement, width?: number, height?: number) {
    if (!(this instanceof HTMLVideoElement)) {
        throw new Error('Video should be used with the new keyword');
    }

    const video = document.createElement('video');
    if (typeof width !== 'undefined') {
        video.width = width;
    }
    if (typeof height !== 'undefined') {
        video.height = height;
    }

    return video;
}

Video.prototype = HTMLVideoElement.prototype;
interface VideoConstructor {
    new (width?: number, height?: number): HTMLVideoElement;
}

let video = (Video as any) as VideoConstructor;
export { video as Video };
