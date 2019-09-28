export function createProgram(gl : WebGL2RenderingContext, vsSource : string, fsSource : string) {
    const program = gl.createProgram();
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    gl.attachShader(program, vs);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return program;
}

export function bindAttribute(gl : WebGL2RenderingContext, program : WebGLProgram, arr : number[], name : string, size : number) {
    const positionLocation = gl.getAttribLocation(program, name);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, size, gl.FLOAT, false, 0, 0);
}

export function bindElements(gl : WebGL2RenderingContext, program : WebGLProgram, arr : number[],) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), gl.STATIC_DRAW);
}

export function duplicate < T > (arr : T[]) : T[] {
    const result : T[] = [];
    for (const element of arr) {
        result.push(element, element);
    }

    return result;
}

export function flatten < T > (arr : T[][]) : T[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

export function createIndices(length : number, start : number) : number[] {
    const arr: number[] = [];
    let index = start;
    for (let j = 0; j < length; j++) {
        const i = index;
        arr.push(i + 0);
        arr.push(i + 1);
        arr.push(i + 2);
        arr.push(i + 2);
        arr.push(i + 1);
        arr.push(i + 3);
        index += 2;
    }

    index += 2;
    return arr;
}
