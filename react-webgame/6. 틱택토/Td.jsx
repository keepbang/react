import React, {useCallback} from 'react';
import {CLICK_CELL, CHANGE_TURN} from './TicTacToe';

const Td = ({rowIndex, cellIndex, dispatch, cellData}) => {
    console.log('td render');
    const onClickTd = useCallback(() => {
        
        if(cellData){
            return;
        }
        dispatch({ type:CLICK_CELL, row:rowIndex, cell:cellIndex});
        
    },[cellData])


    return(
        <td onClick={onClickTd}>{cellData}</td>
    );
};

export default Td;