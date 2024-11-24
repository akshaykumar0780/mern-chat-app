import { HOST } from "@/utils/constants";
import axios from "axios";

export const client = axios.create({
    baseURL: HOST,
})