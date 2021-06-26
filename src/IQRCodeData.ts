export default interface IQRCodeData {
    /** QR code UUID. */
    id?: string,
    /** Text stored in the QR code. */
    text: string,
    /** Name of the QR code. */
    name?: string,
    /** Group ID that the QR code belongs to. */
    groupId: string
}