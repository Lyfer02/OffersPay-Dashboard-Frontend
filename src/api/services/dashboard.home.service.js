import API from "../axios";
import { endpoints } from "../endpoints";

export const dashboardService ={
    home :()=> API.get(endpoints.dashboard.home),
}