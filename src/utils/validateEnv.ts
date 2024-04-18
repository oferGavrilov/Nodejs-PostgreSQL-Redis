import { cleanEnv, port, str } from "envalid";

const validateEnv = () => {
    cleanEnv(process.env, {
        NODE_ENV: str(),
        PORT: port(),
        CORS_ORIGIN: str(),
        POSTGRES_HOST: str(),
        POSTGRES_PORT: port(),
        POSTGRES_USER: str(),
        POSTGRES_PASSWORD: str(),
        POSTGRES_DB: str(),
        POSTGRES_URL: str(),
    });
}

export default validateEnv;
