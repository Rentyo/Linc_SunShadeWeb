import { lazy } from "react";
import { Route } from "react-router-dom";

/****기본 레이아웃*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.js"));

/***** Content 안에 페이지들 ****/
const MapPage = lazy(() => import("../layouts/views/MapPage.js"));
/**** 페이지 전환 ******/
const ThemeRoutes = [
  {
    layout: <FullLayout />,
    children: [
        <Route path="/" element={<MapPage/>} />,        
    ],
  },
];

export default ThemeRoutes;
