import React, {useReducer, createContext, useMemo, useEffect, memo} from 'react';
import Table from './Table';
import Form from './Form'

export const CODE = {
    MINE: -7,
    NORMAL: -1,
    QUESTION: -2,
    FLAG: -3,
    QUESTION_MINE: -4,
    FLAG_MINE: -5,
    CLICKED_MINE: -6,
    OPEND: 0,
};

export const TableContext = createContext({
    tableData : [],
    halted: true,
    dispatch : () => {},
});

const initialState = {
    tableData : [],
    data: {
        row:0,
        cell:0,
        mine:0,
    },
    timer : 0,
    result : "",
    halted : true,
    openedCount : 0,
};

const plantMine = (row, cell, mine) => {
    const candidate = Array(row*cell).fill().map((arr,i) => {
        return i;
    });
    const shuffle = [];
    while (candidate.length > row * cell - mine){
        const chosen = candidate.splice(Math.floor(Math.random() * candidate.length), 1)[0];
        shuffle.push(chosen);
    }
    const data = [];
    for(let i=0;i<row;i++){
        const rowData = [];
        data.push(rowData);
        for(let j=0;j<cell;j++){
            rowData.push(CODE.NORMAL);
        }
    }
    for(let k=0;k < shuffle.length;k++){
        const ver = Math.floor(shuffle[k] / cell);
        const hor = shuffle[k] % cell;
        data[ver][hor] = CODE.MINE;
    }

    return data;
}

export const START_GAME = "START_GAME";
export const OPEN_CELL = "OPEN_CELL";
export const CLICK_MINE = "CLICK_MINE";
export const FLAG_CELL = "FLAG_CELL";
export const QUESTION_CELL = "QUESTION_CELL";
export const NORMALIZE_CELL = "NORMALIZE_CELL";
export const INCREMENT_TIMER = "INCREMENT_TIMER";

const reducer = (state, action) => {
    switch(action.type){
        case START_GAME:
            return {
                ...state,
                data: {
                    row:action.row,
                    cell:action.cell,
                    mine:action.mine,
                },
                tableData: plantMine(action.row, action.cell, action.mine),
                halted: false,
                openedCount : 0,
                result : '',
                timer : 0,
            };
        case OPEN_CELL:{
            const tableData = [...state.tableData];
            tableData.forEach((row,i) => {
                tableData[i] = [...row];
            });
            let tmpCount = 0;
            const checked = [];
            const checkArround = (row,cell) => {
                if([CODE.OPEND, CODE.FLAG_MINE, CODE.FLAG, CODE.QUESTION_MINE, CODE.QUESTION].includes(tableData[row][cell])){
                    return;
                }
                if(row < 0 || row >= tableData.length || cell < 0 || cell >= tableData[0].length){
                    return;
                }
                if(checked.includes(row + ','+cell)){
                    return;
                }else{
                    checked.push(row+','+cell);
                }
                
                let around = [];
                if(tableData[row -1]){
                    around = around.concat(
                        tableData[row-1][cell-1],
                        tableData[row-1][cell],
                        tableData[row-1][cell+1],
                    );
                }
                around = around.concat(
                    tableData[row][cell-1],
                    tableData[row][cell+1],
                );
                if(tableData[row +1]){
                    around = around.concat(
                        tableData[row+1][cell-1],
                        tableData[row+1][cell],
                        tableData[row+1][cell+1],
                    );
                }
                const count = around.filter((v) => {
                    return [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v);
                }).length; 
                if(count === 0){
                    const near = [];
                    if(row - 1 > -1){
                        near.push([row-1, cell-1]);
                        near.push([row-1, cell]);
                        near.push([row-1, cell+1]);
                    }
                    near.push([row,cell - 1]);
                    near.push([row,cell + 1]);
                    if(row + 1 < tableData.length){
                        near.push([row+1, cell-1]);
                        near.push([row+1, cell]);
                        near.push([row+1, cell+1]);
                    }
                    near.forEach((n) => {
                        if(tableData[n[0]][n[1]] !== CODE.OPEND){
                            checkArround(n[0],n[1]);
                        }
                    });
                }
                if(tableData[row][cell] === CODE.NORMAL){
                    tmpCount += 1;
                }
                tableData[row][cell] = count;

            };
            checkArround(action.row,action.cell);
            let halted = false;
            let result = '';
            if(state.data.row * state.data.cell - state.data.mine === state.openedCount + tmpCount){ //승리조건
                halted = true;
                result = `${state.timer}초 승리하셨습니다`;
            }
            return{
                ...state,
                tableData,
                openedCount: state.openedCount + tmpCount,
                halted,
                result,
            };
        }
        case CLICK_MINE:{
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = CODE.CLICKED_MINE;
            return{
                ...state,
                tableData,
                halted: true,
            };
        }
        case FLAG_CELL:{
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            if(tableData[action.row][action.cell] === CODE.MINE){
                tableData[action.row][action.cell] = CODE.FLAG_MINE;
            }else{
                tableData[action.row][action.cell] = CODE.FLAG;
            }
            return{
                ...state,
                tableData,
            };
        }
        case QUESTION_CELL:{
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            if(tableData[action.row][action.cell] === CODE.FLAG_MINE){
                tableData[action.row][action.cell] = CODE.QUESTION_MINE;
            }else{
                tableData[action.row][action.cell] = CODE.QUESTION;
            }
            return{
                ...state,
                tableData,
            };
        }
        case NORMALIZE_CELL:{
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            if(tableData[action.row][action.cell] === CODE.QUESTION_MINE){
                tableData[action.row][action.cell] = CODE.MINE;
            }else{
                tableData[action.row][action.cell] = CODE.NORMAL;
            }
            return{
                ...state,
                tableData,
            };
        }
        case INCREMENT_TIMER: {
            return{
                ...state,
                timer: state.timer + 1,
            }
        }
        default:
            return state;
    }
};


const Mine = () =>{

    const [state, dispatch] = useReducer(reducer, initialState);
    const {tableData, timer, result, halted} = state;

    const value = useMemo(() => ({tableData : tableData, halted: halted, dispatch}), [tableData, halted]);

    useEffect(() => {
        let timer;
        if(halted === false){
            timer = setInterval(() => {
                dispatch({type : INCREMENT_TIMER});
            },1000);
        }
        return () => {
            clearInterval(timer);
        }
    }, [halted]);


    
    return(
        <TableContext.Provider value={value}>
            <Form />
            <div>{timer}</div>
            <Table />
            <div>{result}</div>
        </TableContext.Provider>
    );
};

export default Mine;