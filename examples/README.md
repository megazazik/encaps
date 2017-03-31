Примеры использования "encaps-component-factory"
========
Все примеры находятся в папке src/examples данного проекта (examples, а не корневого проекта encaps-component-factory).

Те файлы, которые можно запустить и отобразить в браузере, находятся в подпапках preview, например, src/examples/separatedState/complexTodos/preview/withFavorites.tsx.

**Запуск должен производиться из папки проекта examples.**

Для запуска необходимо выполнить команду:

npm start -- --file=<file_path> --host=<host> --port=<port>

где 

* <file_path> - путь до файла относительно папки корня проекта examples или относительно корня диска,
* <host> - адрес сервера, можно указать IP. По умолчанию localhost,
* <port> - порт, по молчанию 8080.

Например:

npm start -- --file=src/examples/separatedState/complexTodos/preview/withFavorites --host=127.0.0.1 --port=80

Тогда результат можно будет увидеть по адресу http://127.0.0.1/