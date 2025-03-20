const Position = require('../models/position');

const getPositions = async (req, res) => {
    try {
        const { name } = req.query;
        let filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        const positions = await Position.find(filter);

        return res.status(200).json({
            success: true,
            data: positions
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const addPosition = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Vị trí và mô tả là bắt buộc' });
        }

        const existingPosition = await Position.findOne({ name: name });
        if (existingPosition) {
            return res.status(400).json({ error: 'Vị trí này đã tồn tại' });
        }

        const position = new Position({ name, description });
        await position.save();

        return res.status(201).json({
            success: true,
            message: 'Thêm vị trí thành công',
            data: position
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getPosition = async (req, res) => {
    try {
        const { id } = req.params;
        const position = await Position.findById(id);
        if (!position) {
            return res.status(404).json({ error: 'Vị trí không tồn tại' });
        }
        return res.status(200).json({
            success: true,
            data: position
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Vị trí và mô tả là bắt buộc' });
        }

        const position = await Position.findById(id);
        if (!position) {
            return res.status(404).json({ error: 'Vị trí không tồn tại' });
        }

        const existingPosition = await Position.findOne({ name });
        if (existingPosition && existingPosition._id.toString() !== id) {
            return res.status(400).json({ error: 'Tên vị trí đã tồn tại' });
        }

        const updatedPosition = await Position.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedPosition
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deletePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const position = await Position.findById(id);
        if (!position) {
            return res.status(404).json({ error: 'Vị trí không tồn tại' });
        }
        await Position.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Xóa vị trí thành công'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = { getPositions, getPosition, addPosition, updatePosition, deletePosition };