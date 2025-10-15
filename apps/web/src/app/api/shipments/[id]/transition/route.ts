import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, payload } = body;

    console.log(`Transition request for shipment ${id}:`, { action, payload });

    // Мок логика для переходов
    switch (action) {
      case 'RECEIVE_ACCEPT':
        // Переход с NEW на RECEIVE (этап "Сверка")
        // В реальном приложении здесь было бы сохранение в базу данных
        console.log(`Статус отгрузки ${id} изменен: NEW → RECEIVE`);
        return NextResponse.json({
          ok: true,
          message: 'Переход выполнен успешно',
          newStatus: 'RECEIVE',
          transition: {
            from: 'NEW',
            to: 'RECEIVE',
            action: 'RECEIVE_ACCEPT',
            payload
          }
        });

      case 'RECEIVE_FINISH':
        // Переход с RECEIVE на PACK
        return NextResponse.json({
          ok: true,
          message: 'Сверка завершена',
          newStatus: 'PACK',
          transition: {
            from: 'RECEIVE',
            to: 'PACK',
            action: 'RECEIVE_FINISH',
            payload
          }
        });

      case 'PACK_FINISH':
        // Переход с PACK на MERGE
        return NextResponse.json({
          ok: true,
          message: 'Упаковка завершена',
          newStatus: 'MERGE',
          transition: {
            from: 'PACK',
            to: 'MERGE',
            action: 'PACK_FINISH',
            payload
          }
        });

      case 'SHIP':
        // Переход с MERGE на IN_TRANSIT
        return NextResponse.json({
          ok: true,
          message: 'Отгрузка отправлена',
          newStatus: 'IN_TRANSIT',
          transition: {
            from: 'MERGE',
            to: 'IN_TRANSIT',
            action: 'SHIP',
            payload
          }
        });

      case 'OUT_FOR_DELIVERY':
        // Переход с IN_TRANSIT на ON_DELIVERY
        return NextResponse.json({
          ok: true,
          message: 'Курьер в пути',
          newStatus: 'ON_DELIVERY',
          transition: {
            from: 'IN_TRANSIT',
            to: 'ON_DELIVERY',
            action: 'OUT_FOR_DELIVERY',
            payload
          }
        });

      case 'DELIVER':
        // Переход с ON_DELIVERY на DELIVERED
        return NextResponse.json({
          ok: true,
          message: 'Доставлено',
          newStatus: 'DELIVERED',
          transition: {
            from: 'ON_DELIVERY',
            to: 'DELIVERED',
            action: 'DELIVER',
            payload
          }
        });

      default:
        return NextResponse.json({
          ok: false,
          message: `Неизвестное действие: ${action}`
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Ошибка при выполнении перехода:', error);
    return NextResponse.json({
      ok: false,
      message: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}
