const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export async function searchApi(q: string, limit=20): Promise<{items:any[], nextCursor?:string}> {
  await wait(200);
  // мок: на основе эвристик возвращаем несколько типов
  const items = [
    { id:'shp_102', entity:'shipment', title:`Отгрузка BR-000102`, subtitle:'PACK', link:'/chat/shp_102', badge:'status' },
    { id:'req_77', entity:'request', title:`Запрос REQ-77`, subtitle:'NEW', link:'/chat/req_77' },
    { id:'usr_1', entity:'partner', title:'Papuk Beauty', subtitle:'KYC OK', link:'/partners/1' },
  ];
  return { items, nextCursor: undefined };
}

export async function resolveApi(raw: string): Promise<{ entity: string; id: string; link: string; status?: string; found: boolean }|null> {
  await wait(100);
  
  // Поиск по номеру груза BR-
  if (/^(BR-\d{6}|shp_)/i.test(raw)) {
    const shipmentId = raw.replace('BR-', 'shp_');
    // Мок данных для разных статусов
    const mockStatuses = ['NEW', 'RECEIVE', 'PACK', 'MERGE', 'IN_TRANSIT', 'ON_DELIVERY', 'DELIVERED'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    return { 
      entity: 'shipment', 
      id: shipmentId, 
      link: `/chat/${shipmentId}`,
      status: randomStatus,
      found: true
    };
  }
  
  // Поиск по номеру запроса
  if (/^REQ-\d{2,}$/i.test(raw)) {
    return { 
      entity: 'request', 
      id: raw, 
      link: `/chat/${raw.toLowerCase()}`,
      status: 'NEW',
      found: true
    };
  }
  
  // Поиск по трекингу стороннего перевозчика
  if (/^LP\d+/i.test(raw)) {
    // Мок: 50% шанс найти груз
    const found = Math.random() > 0.5;
    if (found) {
      const mockStatuses = ['NEW', 'RECEIVE', 'PACK', 'MERGE', 'IN_TRANSIT', 'ON_DELIVERY', 'DELIVERED'];
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
      
      return { 
        entity: 'shipment', 
        id: `shp_${raw}`, 
        link: `/chat/shp_${raw}`,
        status: randomStatus,
        found: true
      };
    }
  }
  
  // Груз не найден
  return { 
    entity: 'not_found', 
    id: raw, 
    link: '',
    found: false
  };
}

