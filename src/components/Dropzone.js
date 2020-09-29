import React from 'react';
import Drop from 'react-dropzone';
import {Paper} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => createStyles({
    dropDiv: {
        height: '100%'
    },
    dropPaper: {
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        overflowY: 'auto',
        position: 'relative'
    },
    paper: {
        height: 'calc(100% - 20px)',
        padding: 10
    },
    paperHide: {
        height: '100%'
    },
    root: {
        width: '100%',
        height: '100%',
        display: 'block'
    }
}));


let Dropzone = (props) => {
    const {getFile, hide, showMessage} = props;

    const classes = useStyles();

    let validate = f => {
        // if(!(f.nodes && f.edges)){
        //     this.showMessage('Missing at least one of the following keywords: nodes | edges');
        //     return false;
        // }

        // if(!(Array.isArray(f.nodes) && Array.isArray(f.edges))){
        //     this.showMessage('Type error: nodes & edges must be array of objects');
        //     return false;
        // }

        // let {nodes, edges} = this.modes[this.mode];

        // let nodesIds = [];
        // for(const [i, el] of f.nodes.entries()){
        //     if(!nodes.every((e) => Object.keys(el).includes(e))){
        //         this.showMessage(`Node at index [${i}] misses at least one of the following keywords: ${nodes.join(' | ')}`);
        //         return false;
        //     }
        //     nodesIds.push(el.id);
        // }

        // for(const [i, el] of f.edges.entries()){
        //     if(!edges.every((e) => Object.keys(el).includes(e))){
        //         this.showMessage(`Edge at index [${i}] misses at least one of the following keywords: ${edges.join(' | ')}`);
        //         return false;
        //     }

        //     if(!(nodesIds.includes(el.source) && nodesIds.includes(el.target))){
        //         this.showMessage(`Edge at index [${i}]: source or target node does not exist`);
        //         return false;
        //     }
        // }

        return true;
    }

    let onDrop = (accepted, rejected) => {
        var reader = new FileReader();
        
        reader.onload = function(progressEvent){
            try{
                let f = JSON.parse(this.result);
                if(!validate(f)) return;

                getFile(f);
            }
            catch(e){
                if (e instanceof SyntaxError) {
                    showMessage('Not a JSON file');
                    return;
                }
                else throw(e);
            }
        };

        for (var f of accepted) {
            reader.readAsText(f);
        }
    }

    return (
        <div className={classes.root}>
            <Paper className={hide ? classes.paperHide : classes.paper}>
                <Drop accept=".json" onDrop={onDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()} className={classes.dropDiv}>
                            <Paper className={classes.dropPaper}>
                                <input {...getInputProps()}/>
                                <div>
                                    <p>Try dropping the file here, or click to select a file to upload.</p>
                                </div>
                            </Paper>
                        </div>
                    )}
                </Drop>
            </Paper>
        </div>
    )
}

export default Dropzone;