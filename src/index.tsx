import React, { ChangeEvent, Component } from 'react';
import { render } from 'react-dom';
import 'normalize.css';
import { ImageViewer } from './image-viewer';
import getNormals from 'polyline-normals';
import { createProgram, duplicate, flatten, createIndices, bindAttribute } from './utils';
import { mat4 } from 'gl-matrix';
import * as lineShaders from './shaders/polyline';
import { VectorLayer } from './vector-layer';
import { VertexArrayObject } from './webgl/VertexArrayObject';
import {PNG} from 'pngjs';
class ImageUpload extends React.Component<
    {},
    {
        src?: PNG;
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div>
                <div>
                    <input type="file" accept="image/*" onChange={this.onImageChanged} />
                </div>
                {this.state.src ? (
                    <ImageViewer image={this.state.src} width={300} height={300} />
                ) : null}
            </div>
        );
    }

    onImageChanged = (ev: ChangeEvent<HTMLInputElement>) => {
        const file = ev.currentTarget.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.addEventListener(
            'load',
            () => {
                // const image = new Image();
                // image.addEventListener(
                //     'load',
                //     () => {
                //         this.setState(() => {
                //             return { src: image };
                //         });
                //     },
                //     { once: true }
                // );
                let buffer = reader.result as ArrayBuffer;
                const png = new PNG({bitDepth:16});
                png.parse(new Buffer(buffer), (err, data) => {
                    this.setState(() => {
                        return {src:data};
                    })
                })
                // image.src = reader.result;
            },
            { once: true }
        );
    };
}

class VectorCanvas extends React.Component {
    createVao(
        gl: WebGL2RenderingContext,
        vectorLayers: VectorLayer[],
        program: WebGLProgram
    ): VertexArrayObject {
        const indexBuffer: number[] = [];
        const positionBuffer: number[] = [];
        const miterBuffer: number[] = [];
        const thicknessBuffer: number[] = [];
        const colorBuffer: number[] = [];
        const normalBuffer: number[] = [];
        const distanceBuffer: number[] = [];
        for (const vector of vectorLayers) {
            const path = vector.path;
            const normals = getNormals(path, vector.closed);
            const length = path.length + +vector.closed;
            const indexStart = indexBuffer.length == 0 ? 0 : Math.max(...indexBuffer) + 1;
            indexBuffer.push(...createIndices(length - 1, indexStart));
            positionBuffer.push(...flatten(duplicate(path)));
            const x = flatten(duplicate(normals.map(normal => normal[0])));
            normalBuffer.push(...x);
            const miters = duplicate(normals.map(normal => normal[1])).map(
                (miter, idx) => (idx % 2 == 0 ? -miter : miter)
            );
            miterBuffer.push(...miters);
            distanceBuffer.push(...duplicate(getDistanceArray(path, vector.closed)));
            if (vector.closed) {
                positionBuffer.push(...path[0], ...path[0]);
                normalBuffer.push(...normals[0][0], ...normals[0][0]);
                miterBuffer.push(miters[0], miters[1]);
            }

            for (let i = 0; i < 2 * length; i++) {
                thicknessBuffer.push(vector.style.thickness);
                colorBuffer.push(...vector.style.color);
            }
        }

        return new VertexArrayObject(
            gl,
            program,
            {
                a_position: {
                    buffer: positionBuffer,
                    size: 2,
                },
                a_normal: {
                    buffer: normalBuffer,
                    size: 2,
                },
                a_color: {
                    buffer: colorBuffer,
                    size: 3,
                },
                a_miter: {
                    buffer: miterBuffer,
                    size: 1,
                },
                a_thickness: {
                    buffer: thicknessBuffer,
                    size: 1,
                },
                a_distance: {
                    buffer: distanceBuffer,
                    size: 1,
                },
            },
            indexBuffer
        );
    }
    getVectorLayers(): VectorLayer[] {
        const path: Array<[number, number]> = [];
        for (let index = 0; index < 360; index++) {
            let angle = (Math.PI / 180) * index;
            path.push([200 * Math.cos(angle), 200 * Math.sin(angle)]);
        }
        return [
            {
                path: [[-200, 0], [0, 280], [200, 0]],
                closed: true,
                style: {
                    thickness: 16,
                    color: [0, 0, 1],
                },
            },
            {
                path: [[-200, 190], [0, -90], [200, 190]],
                closed: true,
                style: {
                    thickness: 16,
                    color: [1, 0, 0],
                },
            },
            {
                path: path,
                closed: true,
                style: {
                    color: [0, 1, 0],
                    thickness: 3,
                },
            },
        ];
    }
    private canvas: HTMLCanvasElement;
    render() {
        return (
            <div className="canvas-container">
                <div className="canvas-controls">
                    <button className="round-button">+</button>
                    <button className="round-button">-</button>
                </div>
                <canvas width={700} height={700} ref={canvas => (this.canvas = canvas)} />
            </div>
        );
    }

    componentDidMount() {
        const gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;

        const program = createProgram(
            gl,
            lineShaders.vertexShader,
            lineShaders.fragmentShader
        );

        const vectors = this.getVectorLayers();
        const vao = this.createVao(gl, vectors, program);

        const matrix = mat4.create();
        const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        mat4.scale(matrix, matrix, [2 / gl.canvas.width, 2 / gl.canvas.height, 1]);
        mat4.translate(matrix, matrix, [-1, -1, 0]);
        gl.useProgram(program);
        gl.uniformMatrix4fv(matrixLocation, false, matrix);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        vao.draw(gl.TRIANGLES);
    }
}

render(<ImageUpload />, document.getElementById('root'));

function getDistanceArray(path: Array<[number, number]>, closed: boolean) {
    let sum = 0;
    let distances = [0];
    for (let i = 1; i < path.length; i++) {
        const currDistance = distance(path[i - 1], path[i]);
        sum += currDistance;
        distances.push(sum);
    }

    if (closed) {
        sum += distance(path[distances.length - 1], path[0]);
        distances.push(sum);
    }

    return distances.map(distance => distance / sum);
}

function distance(first: [number, number], second: [number, number]) {
    return Math.sqrt(square(first[0] - second[0]) + square(first[1] - second[1]));
}

function square(x: number) {
    return x * x;
}
