module.exports = {
    'fuet-api': {
        input: './openapi.json',
        output: {
            mode: 'tags-split',
            target: './src/api',
            schemas: './src/api/model',
            client: 'react-query',
            httpClient: 'axios',
            override: {
                mutator: {
                    path: './src/api/axios-custom.ts',
                    name: 'customInstance',
                },
                query: {
                    useInfinite: true,
                    useInfiniteQueryParam: 'page',
                },
                operations: {
                    download_file_api_v1_r2_storage_download__filename__get: {
                        axios: {
                            responseType: 'blob',
                        },
                    },
                },
            },
        },
    },
};
