module.exports = {
    'fuet-api': {
        input: './openapi.json',
        output: {
            mode: 'tags-split',
            target: './src/api',
            schemas: './src/api/model',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/axios-custom.ts',
                    name: 'customInstance',
                },
            },
        },
    },
};
