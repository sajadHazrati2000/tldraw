export const downloadFile = (jsonData, filename = 'data', extension = 'csv') => {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {

        return 0;
    }
    let data = [];
    for (let i of jsonData) {
        data.push({
            id: i.id,
            x: i.x,
            y: i.y,
            rotation: i.rotation,
            type: i.type,

            points: extension === 'csv' ? i.props.segments[0].points.map((i, j) => [i.x, i.y, i.z, "/"]) :
                i.props.segments[0].points.map((i, j) => ({x: i.x, y: i.y}))
        });
    }
    let blob = null
    if (extension === 'csv') {
        const csv = jsonToCsv(data);
        blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    } else {
        blob = new Blob([JSON.stringify(data)], {type: 'text/json;charset=utf-8;'});

    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename + '.' + extension);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const jsonToCsv = (json) => {
    if (!json || json.length === 0) return '';
    const keys = Object.keys(json[0]);
    const header = keys.join(',') + '\n';
    const rows = json.map(row => keys.map(key => {
        const value = row[key] === undefined ? '' : row[key];
        return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')).join('\n');
    return header + rows;
};
