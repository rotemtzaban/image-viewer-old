declare module 'polyline-normals'{
    const getNormals:(path:number[][], closed?:boolean) => Array<[[number, number], number]>
    export default getNormals;
}