import {bindAttribute, bindElements} from "../utils";

export class VertexArrayObject {
    private readonly _vao : WebGLVertexArrayObject;
    constructor(private readonly _gl : WebGL2RenderingContext, private readonly _program : WebGLProgram, private readonly _attributes : Dictionary < VertexAttribute >, private _elements?: number[]) {
        this._vao = _gl.createVertexArray() as WebGLVertexArrayObject;
        this.bindAttributes();
    }

    private bindAttributes() {
        const gl = this._gl;
        this.bind();
        for (const name in this._attributes) {
            const attribute = this._attributes[name];
            bindAttribute(gl, this._program, attribute.buffer, name, attribute.size);
        }

        if (this._elements) {
            bindElements(gl, this._program, this._elements);
        }

        this.unbind();
    }

    public readonly setAttributes = (attributes : Dictionary < VertexAttribute >) => {
        for (const key in attributes) {
            const attribute = attributes[key];
            this._attributes[key] = attribute;
            bindAttribute(this._gl, this._program, attribute.buffer, name, attribute.size);
        }
    }

    public readonly setElements = (elements : number[]) => {
        this._elements = elements;
        this.bind();
        bindElements(this._gl, this._program, this._elements);
        this.unbind();
    }

    public readonly draw = (mode : number, count? : number) => {
        const gl = this._gl;
        this.bind();
        if (this._elements) {
            gl.drawElements(mode, count || this._elements.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(mode, 0, count);
        }

        this.unbind();
    }

    private unbind() {
        this
            ._gl
            .bindVertexArray(null);
    }

    private bind() {
        this
            ._gl
            .bindVertexArray(this._vao);
    }
}

interface VertexAttribute {
    size : number;
    buffer : number[];
}

type Dictionary < T > = {
    [key : string]: T
};
