export const downloadCsv = (jsonData, filename = 'data.csv') => {  
    if (!Array.isArray(jsonData) || jsonData.length === 0) {  

      return 0;  
    }
    let data = [];
    for(let i of jsonData){
      data.push({
        id:i.id,
        x:i.x,
        y:i.y,
        opacity:i.opacity,
        type:i.type,
        typeName:i.typeName,
        color:i.props.color,
        points:i.props.segments[0].points.map((i,j)=>[i.x,i.y,i.z,"/"])

      });
    }
    const csv = jsonToCsv(data);  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });  
    const url = URL.createObjectURL(blob);  
    const link = document.createElement('a');  
    link.href = url;  
    link.setAttribute('download', filename);
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