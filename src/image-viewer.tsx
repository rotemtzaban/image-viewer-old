import React from 'react';
import './main.css';
import { mat4 } from 'gl-matrix';
import { createProgram } from './utils';
import { PNG } from 'pngjs';
export class ImageViewer extends React.Component<ImageViewerProps> {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;
    private vao: WebGLVertexArrayObject;
    private location: WebGLUniformLocation;
    // private camera: three.OrthographicCamera;
    constructor(props: ImageViewerProps) {
        super(props);
    }

    private readonly vsSource = `#version 300 es
        
        in vec4 a_position;
        in vec2 a_texcoord;
        
        out vec2 v_texcoord;
        uniform mat4 u_matrix;
        void main() {
         gl_Position = u_matrix * a_position;
         v_texcoord = a_texcoord;   
        }`;

    private readonly fsSource = `#version 300 es
        precision highp float;
 
        in vec2 v_texcoord;
 
        uniform sampler2D u_texture;
 
        out vec4 outColor;
 
        void main() {
            highp vec4 texColor = texture(u_texture, v_texcoord);
            outColor = vec4(texColor.rgb, 1.0);
        }`;

    render() {
        return (
            <div tabIndex={-1} className="viewer-container">
                <canvas
                    className="viewer-canvas"
                    ref={canvas => (this.canvas = canvas)}
                    width={this.props.width}
                    height={this.props.height}
                />
            </div>
        );
    }

    componentDidMount() {
        // super.componentDidMount();
        const gl = (this.gl = this.canvas.getContext('webgl2'));
        if (!gl) {
            throw new Error('shit');
        }

        const program = (this.program = createProgram(gl, this.vsSource, this.fsSource));
        gl.useProgram(program);
        this.vao = gl.createVertexArray() as WebGLVertexArrayObject;
        gl.bindVertexArray(this.vao);
        this.bindPositionAttribute(gl, program);
        this.bindTexCoordAttribute(gl, program);
        // gl.bindVertexArray(null);
        this.location = gl.getUniformLocation(program, 'u_matrix') as WebGLUniformLocation;
        this.bindMatrix(gl, program);
        this.bindImage(gl);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    private bindImage(gl: WebGL2RenderingContext) {
        gl.getExtension('EXT_color_buffer_float');
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const buffer = new Uint8Array(this.props.image.data.buffer);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            this.props.image.width,
            this.props.image.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            buffer
        );
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    private bindMatrix(gl: WebGL2RenderingContext, program: WebGLProgram) {
        let matrix = mat4.create();
        const canvasWidth = gl.canvas.width,
            centerX = canvasWidth / 2,
            canvasHeight = gl.canvas.height,
            centerY = canvasHeight / 2,
            image = this.props.image;
        const imageAspectRatio = image.height / image.width;
        const canvasAspectRatio = canvasHeight / canvasWidth;
        let imageHeightInCanvas, imageWidthInCanvas;
        if (imageAspectRatio > canvasAspectRatio) {
            imageHeightInCanvas = canvasHeight;
            imageWidthInCanvas = imageHeightInCanvas / imageAspectRatio;
        } else {
            imageWidthInCanvas = canvasWidth;
            imageHeightInCanvas = imageWidthInCanvas * imageAspectRatio;
        }

        matrix = mat4.ortho(matrix, 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
        // translate our quad to dstX, dstY
        matrix = mat4.translate(matrix, matrix, [
            centerX - imageWidthInCanvas / 2,
            centerY - imageHeightInCanvas / 2,
            0,
        ]);

        // scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        matrix = mat4.scale(matrix, matrix, [imageWidthInCanvas, imageHeightInCanvas, 1]);

        gl.uniformMatrix4fv(this.location, false, matrix);
    }

    componentDidUpdate() {
        // this.gl.useProgram(this.program);
        this.bindMatrix(this.gl, this.program);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.bindImage(this.gl);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    private bindPositionAttribute(gl: WebGL2RenderingContext, program: WebGLProgram) {
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }

    private bindTexCoordAttribute(gl: WebGL2RenderingContext, program: WebGLProgram) {
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_texcoord');
        const positions = [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1];
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, true, 0, 0);
    }
}

interface ImageViewerProps {
    image: PNG;
    width: number;
    height: number;
}
