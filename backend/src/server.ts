import { PORT, serverHttp } from "./app";

serverHttp.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));