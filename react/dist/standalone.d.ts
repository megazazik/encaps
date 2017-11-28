/// <reference types="react" />
import * as React from "react";
import { IChildProps } from "./types";
import { Reducer } from 'encaps';
export declare function getStandalone<P, S>(reducer: Reducer<S>, Element: React.StatelessComponent<P & IChildProps<S>> | React.ComponentClass<P & IChildProps<S>>): React.ComponentClass<P> | React.StatelessComponent<P>;
