import { Response } from "express"
import { AddressRepository } from "../../../DB/Repositories"
import { IAuthRequest } from "../../../Types/Interfaces"
import { IAddressDto } from "../../../Types/DTO"
import { Types } from "mongoose"

class AddressService {

    private addressRepo = new AddressRepository()

    create = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { phone, country, city, street, postalCode, buildingNumber, isDefault = false, label }: IAddressDto = req.body

        const isAddressExist = await this.addressRepo.findOne({
            filters: {
                userId: _id,
                country,
                city,
                street
            }
        })
        if (isAddressExist) return res.status(403).json({ message: "Address is already exist" })

        await this.addressRepo.create({
            userId: _id,
            phone,
            country,
            city,
            street,
            postalCode,
            buildingNumber,
            isDefault,
            label
        })

        res.status(201).json({ message: "Address creatred successfully" })
    }

    update = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { addressId } = req.params
        const { phone, country, city, street, postalCode, buildingNumber, label }: IAddressDto = req.body

        const address = await this.addressRepo.findById(new Types.ObjectId(addressId))
        if (!address) return res.status(404).json({ message: "Address not found" })

        if (phone) address.phone = phone
        if (country) address.country = country
        if (city) address.city = city
        if (street) address.street = street
        if (postalCode) address.postalCode = postalCode
        if (buildingNumber) address.buildingNumber = buildingNumber
        if (label) address.label = label

        await address.save()
        res.status(200).json({ message: "Address updated successfully" })
    }

    listAdress = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser

        const address = await this.addressRepo.find({
            filters: {
                userId: _id
            }
        })

        res.status(200).json({ message: "data fetched successfully", data: address })
    }

    delete = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { addressId } = req.params

        const address = await this.addressRepo.findOneAndDelete({
            filters: {
                _id: new Types.ObjectId(addressId)
            }
        })
        if (!address) return res.status(404).json({ message: "Address not found" })

        res.status(200).json({ message: "Address deleted successfully" })
    }

}

export default new AddressService