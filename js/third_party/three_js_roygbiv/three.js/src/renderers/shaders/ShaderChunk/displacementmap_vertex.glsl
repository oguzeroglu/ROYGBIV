#ifdef USE_DISPLACEMENTMAP

	vec2 transformedUV = ( uvTransform * vec3( uv, 1 ) ).xy;
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, transformedUV ).x * displacementScale + displacementBias );

#endif
