import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { reason, comment } = await request.json();

    console.log(`Delete request for shipment ${id}:`, { reason, comment });

    // В реальном приложении здесь была бы логика:
    // 1. Проверка прав доступа
    // 2. Валидация данных
    // 3. Обновление статуса отгрузки на DELETED
    // 4. Создание записи о возврате поставщику
    // 5. Уведомление всех участников чата
    // 6. Переход чата в неактивный статус

    // Мок-ответ
    return NextResponse.json({
      ok: true,
      message: 'Отгрузка успешно удалена',
      newStatus: 'DELETED',
      action: 'delete_shipment',
      data: {
        reason,
        comment,
        deletedAt: new Date().toISOString(),
        chatStatus: 'inactive'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in delete shipment:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении отгрузки' },
      { status: 500 }
    );
  }
}

