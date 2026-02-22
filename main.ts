namespace scd41 {
    // Kiinteät I2C-osoitteet ja komennot
    const SCD41_ADDR = 98;
    const SCD41_CMD_START_PERIODIC = 8625;
    const SCD41_CMD_READ_MEASUREMENT = 60421;

    // Sisäiset muuttujat arvojen tallentamiseen
    let co2 = 0;
    let lampotila = 0;
    let kosteus = 0;

    /**
     * Alustaa SCD41-anturin. Tämä tulee suorittaa ohjelman alussa (Käynnistyksessä).
     */
    //% blockId=scd41_init block="alusta SCD41"
    export function alustaSCD41(): void {
        pins.i2cWriteNumber(
            SCD41_ADDR,
            SCD41_CMD_START_PERIODIC,
            NumberFormat.UInt16BE,
            false
        );
        basic.pause(5000)
    }

    /**
     * Päivittää uusimmat mittausarvot anturilta. 
     * Kutsu tätä lohkoa esimerkiksi 5 sekunnin välein ennen arvojen lukemista.
     */
    //% blockId=scd41_update block="lue SCD41"
    export function lueSCD41(): void {
        basic.pause(5000)
        pins.i2cWriteNumber(
            SCD41_ADDR,
            SCD41_CMD_READ_MEASUREMENT,
            NumberFormat.UInt16BE,
            false
        );

        // TÄRKEÄÄ: Pieni tauko kirjoituksen ja luvun välissä
        basic.pause(50);

        let buffer = pins.i2cReadBuffer(SCD41_ADDR, 9);
        if (buffer.length < 9) {
            return;
        }

        co2 = (buffer[0] << 8) | buffer[1];

        let rawTemp = (buffer[3] << 8) | buffer[4];
        lampotila = -45 + 175 * (rawTemp / 65535);
        lampotila = Math.round(lampotila * 10) / 10;

        let rawHum = (buffer[6] << 8) | buffer[7];
        kosteus = 100 * (rawHum / 65535);
        kosteus = Math.round(kosteus * 10) / 10;
    }

    /**
     * Palauttaa viimeksi mitatun CO2-arvon (ppm).
     */
    //% blockId=scd41_get_co2 block="CO2"
    export function haeCO2(): number {
        return co2;
    }

    /**
     * Palauttaa viimeksi mitatun lämpötilan (°C).
     */
    //% blockId=scd41_get_temp block="lämpötila"
    export function haeLampotila(): number {
        return lampotila;
    }

    /**
     * Palauttaa viimeksi mitatun ilmankosteuden (%).
     */
    //% blockId=scd41_get_hum block="kosteus"
    export function haeKosteus(): number {
        return kosteus;
    }
}
