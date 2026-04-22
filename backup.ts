// GT20L16 字库芯片 SPI 读取
// 接线：
// SCK → P13
// MOSI → P15
// MISO → P14
// CS → P16
// HOLD、WP 接 3.3V

const CS = DigitalPin.P16;
pins.digitalWritePin(CS, 1);

// SPI 初始化（硬件SPI）
pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13);
pins.spiFormat(8, 0);    // 8位，模式0
pins.spiFrequency(2000000);

// 从 GT20L16 读一个字节（24位地址）
function gt20ReadByte(addr: number): number {
    pins.digitalWritePin(CS, 0);

    // 命令 0x80 + 24位地址
    pins.spiWrite(0x80);
    pins.spiWrite((addr >> 16) & 0xFF);
    pins.spiWrite((addr >> 8) & 0xFF);
    pins.spiWrite(addr & 0xFF);

    const b = pins.spiWrite(0x00);
    pins.digitalWritePin(CS, 1);
    return b;
}

// 读一段数据
function gt20ReadBuf(addr: number, len: number): number[] {
    const buf: number[] = [];
    for (let i = 0; i < len; i++) {
        buf.push(gt20ReadByte(addr + i));
    }
    return buf;
}

// 读取 16x16 汉字点阵（GB2312）
function readHz16(hz: string): number[] {
    const gb = hz.toCharArray()[0];
    const q = (gb >> 8) - 0xA1;
    const w = (gb & 0xFF) - 0xA1;
    const addr = 0x100000 + (q * 94 + w) * 32;
    return gt20ReadBuf(addr, 32);
}

// 读取 ASCII 8x16
function readAscii8x16(c: string): number[] {
    const code = c.charCodeAt(0);
    const addr = 0x20000 + 16 * 32 + code * 16;
    return gt20ReadBuf(addr, 16);
}

// 测试
basic.showIcon(IconNames.Yes);
const dot = readHz16("中");
serial.writeLine("中点阵：" + dot.toString());

const aDot = readAscii8x16("A");
serial.writeLine("A点阵：" + aDot.toString());
