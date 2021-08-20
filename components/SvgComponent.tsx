import React from "react";
import { SvgXml } from "react-native-svg";

export default function SvgComponent({xml, width}){

    const SvgImage = () => <SvgXml xml={xml} width={width} />;
    return <SvgImage />;
}