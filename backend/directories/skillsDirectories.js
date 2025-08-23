const skillsDirectory = async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }

    const url = `https://ec.europa.eu/esco/api/search?text=${encodeURIComponent(
        query
    )}&type=skill&language=en&limit=10`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const skills =
            data._embedded?.results?.map((item) => ({
                id: item.id,
                label: item.title,
            })) ?? [];

        res.json(skills);
    } catch (error) {
        console.error('Error in fetching skills:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
}

module.exports = {
    skillsDirectory
};