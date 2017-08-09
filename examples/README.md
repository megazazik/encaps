The "encaps" usage examples
========
All examples are in the '/examples/src/examples' folder.

You can run any example which is in the 'preview' subfolder of the '/examples/src/examples/'.

**To run exapmles you must be in the '/examples/' folder.**

Use the following command to run:

npm start -- --file=<file_path> --host=<host> --port=<port>

где 

* <file_path> - path ti the prevew example file (relavire or absolute),
* <host> - host or IP. By default - localhost,
* <port> - by default - 8080.

For example:
npm start -- --file=src/examples/3_todos/page/preview/stress --host=127.0.0.1 --port=80
Then you can see the result at http://127.0.0.1/