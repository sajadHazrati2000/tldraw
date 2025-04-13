import {useEffect, useRef, useState} from 'react'
import {Tldraw, useEditor} from 'tldraw'
import 'tldraw/tldraw.css'
import "./index.css"
import {Dropdown, FloatButton, Splitter} from "antd"
import {CaretRightOutlined, PauseOutlined,} from "@ant-design/icons"
import useMessage from 'antd/es/message/useMessage'
import FloatButtonGroup from 'antd/es/float-button/FloatButtonGroup'
import {downloadFile} from './fileDownload.jsx'

export default function App() {
    const [shapes, setshapes] = useState([]);
    const main = useRef([]);
    const meta = useRef([]);
    const total = useRef([]);
    const [start, setstart] = useState(false);
    const [tool, settool] = useState("draw") // "hand", "draw", "rectangle", "ellipse", "line", "text", "image", "shape", "select"
    const [camera, setcamera] = useState(null);
    const [clear, setclear] = useState(false);
    const [group, setgroup] = useState(false);
    const [messageApi, messageContexHolder] = useMessage();
    const [ungroup, setungroup] = useState(false);
    const [grid, setgrid] = useState(true);
    const [realtime, setrealtime] = useState(false);
    const [darkmode, setdarkmode] = useState(false);

    function handleStart() {
        if (start) {
            console.log("meta");
            console.log(meta.current);
            console.log("main");
            console.log(main.current);
            console.log("total with meta active")
            console.log(total.current);
            console.log("total");
            console.log(shapes);
            messageApi.info({
                content: "meta turned off",
            })
            return setstart(false);
        }
        messageApi.info({
            content: "meta turned on"
        })
        setstart(true);
    }

    function handleDownload(data, filename, type) {
        const tmp = downloadFile(data, filename, type);
        if (tmp == 0) {
            messageApi.info({
                content: "no data found"
            })
        }
    }

    function handleUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const jsonData = JSON.parse(reader.result);
                    const newElements = jsonData.map((shape) => ({
                        id: shape.id,
                        opacity: 1,
                        type: shape.type,
                        x: shape.x,
                        y: shape.y,
                        rotation: shape.rotation,
                        props: {
                            segments: [{
                                type: 'free',
                                points: shape.points.map((point) => ({x: point.x, y: point.y}))
                            }],
                        },

                    }));

                    setshapes((prevShapes) => {
                        console.log(prevShapes)
                        console.log(jsonData)
                        console.log(newElements)
                        return [...prevShapes, ...newElements]
                    });
                    messageApi.success({content: 'data imported'});
                } catch (error) {
                    messageApi.error({content: 'Invalid json format!'});
                }
            };
            reader.readAsText(file);
        }
    }

    return (
        <>
            {messageContexHolder}
            <Splitter className='con'>
                <Splitter.Panel className='page'>
                    <Tldraw inferDarkMode={darkmode} hideUi>
                        <Main realtime={realtime} total={total} grid={grid} ungroup={ungroup}
                              group={group} clear={clear} tool={tool} shapes={shapes} setshapes={setshapes}
                              main={main} start={start} camera={camera} setcamera={setcamera}/>
                    </Tldraw>
                </Splitter.Panel>

                <Splitter.Panel className='pageMeta'>
                    <Tldraw inferDarkMode={darkmode} hideUi>
                        <Meta realtime={realtime} total={total} ungroup={ungroup} group={group} clear={clear}
                              tool={tool} shapes={shapes} setshapes={setshapes} meta={meta} start={start}
                              camera={camera} setcamera={setcamera}/>
                    </Tldraw>
                </Splitter.Panel>

            </Splitter>
            <FloatButtonGroup className='fab' shape='square' trigger="click">
                <FloatButton description="meta" shape='square' tooltip="meta"
                             icon={start ? <PauseOutlined/> : <CaretRightOutlined/>}
                             onClick={handleStart}></FloatButton>
                <FloatButton description="clear" shape='square' tooltip="clear"
                             onClick={() => setclear(!clear)}></FloatButton>
                <FloatButton description="pak kon" shape='square' tooltip="pak kon"
                             onClick={() => settool("eraser")}></FloatButton>
                <FloatButton description="hand" shape='square' tooltip="hand"
                             onClick={() => settool("hand")}></FloatButton>
                <FloatButton description="draw" shape='square' tooltip="draw"
                             onClick={() => settool("draw")}></FloatButton>
                <FloatButton description="select" shape='square' tooltip="select"
                             onClick={() => settool("select")}></FloatButton>
                <FloatButton description="line" shape='square' tooltip="line"
                             onClick={() => settool("line")}></FloatButton>
                <FloatButton description="group" shape='square' tooltip="group"
                             onClick={() => setgroup(!group)}></FloatButton>
                <FloatButton description="ungroup" shape='square' tooltip="ungroup"
                             onClick={() => setungroup(!ungroup)}></FloatButton>
                <FloatButton description="grid" shape='square' tooltip="grid"
                             onClick={() => setgrid(!grid)}></FloatButton>
                <FloatButton description="realtime" shape='square' tooltip="realtime"
                             onClick={() => setrealtime(!realtime)}></FloatButton>
                <FloatButton description="Upload JSON" shape='square' tooltip="Upload JSON file"
                             onClick={() => document.getElementById('import-input').click()}/>
                <input
                    id="import-input"
                    type="file"
                    style={{display: 'none'}}
                    onChange={handleUpload}
                />

                <FloatButton description="export as json" shape='square' tooltip="json data for all the shapes"
                             onClick={() => handleDownload(shapes, "data", 'json')}></FloatButton>
                <Dropdown trigger={["contextMenu"]} menu={{
                    items: [
                        {
                            key: 0,
                            label: "meta with meta active",
                            onClick: () => handleDownload(meta.current, "meta", 'csv')
                        },
                        {
                            key: 1,
                            label: "main with meta active",
                            onClick: () => handleDownload(main.current, 'main', 'csv')
                        },
                        {
                            key: 2,
                            label: "total with meta active",
                            onClick: () => handleDownload(total.current, 'total', 'csv')
                        },

                    ]
                }}>
                    <FloatButton description="csv" shape='square' tooltip="csv data for all the shapes"
                                 onClick={() => handleDownload(shapes, "data", 'csv')}></FloatButton>
                </Dropdown>
            </FloatButtonGroup>

        </>
    )
}


function Main({shapes, setshapes, main, total, start, camera, setcamera, tool, clear, group, ungroup, grid, realtime}) {
    const editor = useEditor();
    useEffect(() => {
        editor.addListener("event", (data) => {
            const event = realtime ? "pointer_move" : "pointer_up";
            if (data.type == "pointer" && data.name == event) {
                const tmp = editor.getCurrentPageShapes();
                setshapes(tmp);
                if (start) {
                    main.current.push(tmp.at(-1));
                    total.current.push(tmp.at(-1));
                }
                editor.setCurrentTool(tool)
            }
            if (data.type == "pointer" && data.name == "pointer_move") {
                const tmp = editor.getCamera();
                setcamera(tmp);
            }

        });
        editor.setCurrentTool("draw");


        return () => {
            editor.removeAllListeners("event");
        }
    }, [start, tool, realtime]);

    useEffect(() => {
        const tmp = editor.getCurrentPageShapes();
        if (tmp.length > shapes.length) {
            editor.deleteShapes(tmp);
        }
        editor.createShapes(shapes);

    }, [shapes]);


    useEffect(() => {
        if (camera) {
            editor.setCamera(camera);
        }
        {
        }
    }, [camera]);

    useEffect(() => {
        editor.setCurrentTool(tool);
    }, [tool]);

    useEffect(() => {
        editor.deleteShapes(shapes);
        setshapes([]);

    }, [clear]);

    useEffect(() => {
        editor.groupShapes(editor.getSelectedShapes());
    }, [group]);

    useEffect(() => {
            editor.ungroupShapes(editor.getSelectedShapes());
        }
        , [ungroup])

    useEffect(() => {
        editor.updateInstanceState({isGridMode: grid});
        //editor.updateDocumentSettings({gridSize:10});

    }, [grid])


    return null;

}

function Meta({shapes, setshapes, meta, total, start, camera, setcamera, tool, clear, group, ungroup, realtime}) {
    const editor = useEditor();
    useEffect(() => {
        editor.addListener("event", (data) => {
            const event = realtime ? "pointer_move" : "pointer_up";
            if (data.type == "pointer" && data.name == event) {
                const tmp = editor.getCurrentPageShapes();
                console.log(tmp);
                setshapes(tmp);
                if (start) {
                    meta.current.push(tmp.at(-1));
                    total.current.push(tmp.at[-1]);
                }
                editor.setCurrentTool(tool)
            }
            if (data.type == "pointer" && data.name == "pointer_move") {
                const tmp = editor.getCamera();
                setcamera(tmp);
            }
        });

        editor.setCurrentTool("draw");

        return () => {
            editor.removeAllListeners("event")
        }

    }, [start, tool, realtime]);

    useEffect(() => {
        const tmp = editor.getCurrentPageShapes();
        if (tmp.length > shapes.length) {
            editor.deleteShapes(tmp);
        }
        editor.createShapes(shapes);

    }, [shapes]);

    useEffect(() => {
        if (camera) {
            editor.setCamera(camera);
        }
    }, [camera])

    useEffect(() => {
        editor.setCurrentTool(tool)
    }, [tool]);

    useEffect(() => {
        editor.deleteShapes(shapes);
        setshapes([]);
    }, [clear]);

    useEffect(() => {
        editor.groupShapes(editor.getSelectedShapes());
    }, [group]);

    useEffect(() => {
            editor.ungroupShapes(editor.getSelectedShapes());
        }
        , [ungroup])


    return null;

}
