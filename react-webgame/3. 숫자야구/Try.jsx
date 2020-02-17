import React,{useRef,useState, memo} from 'react';


const Try = memo(({tryInfo}) => {
    return(
        <li>
            <div>{tryInfo.try}</div>
            <div>{tryInfo.result}</div>
        </li>
    );
});

export default Try;