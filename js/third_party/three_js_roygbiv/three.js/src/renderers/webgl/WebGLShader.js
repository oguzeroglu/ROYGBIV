/**
 * @author mrdoob / http://mrdoob.com/
 */

function addLineNumbers( string ) {

	var lines = string.split( '\n' );

	for ( var i = 0; i < lines.length; i ++ ) {

		lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];

	}

	return lines.join( '\n' );

}

function WebGLShader( gl, type, string ) {

	var shader = gl.createShader( type );
	window.webglCallbackHandler.onCreateShader();

	window.webglCallbackHandler.onBeforeShaderSource(shader, string);
	//gl.shaderSource( shader, string );
	window.webglCallbackHandler.onBeforeCompileShader(shader);
	//gl.compileShader( shader );

	var shaderCompilationError = false;
	if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) === false ) {

		console.error( 'THREE.WebGLShader: Shader couldn\'t compile.' );
		shaderCompilationError = true;
	}

	if ( gl.getShaderInfoLog( shader ) !== '' ) {
		var glShaderInfoLog = gl.getShaderInfoLog(shader);
		var lines = addLineNumbers(string);
		console.warn( 'THREE.WebGLShader: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', glShaderInfoLog, lines);
		if (shaderCompilationError){
			window.webglCallbackHandler.onShaderCompilationError(type, glShaderInfoLog, lines);
		}else{
			window.webglCallbackHandler.onShaderCompilationWarning(type, glShaderInfoLog, lines);
		}
	}

	// --enable-privileged-webgl-extension
	// console.log( type, gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

	return shader;

}


export { WebGLShader };
