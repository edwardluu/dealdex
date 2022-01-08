import { Grid, GridItem, Box, VStack, Heading, Text, Container, Flex, SimpleGrid } from '@chakra-ui/react';

const steps = [
    { label: "25%", description: "02/05/2022" },
    { label: "50%", description: "03/05/2022" },
    { label: "70%", description: "04/05/2022" },
    { label: "100%", description: "05/05/2022" },
]

function StepPercent(props) {
    return (
        <Grid templateColumns='repeat(4, 1fr)' gap={6} px={10} py="20px">
            {steps.map(({ label, description }, index) => (
                <GridItem w='100%' h='10' key={index}>
                    <Box w='100%' h='1' bg={(props.percent - 25) > (index * 25) ? '#90CDF4' : '#E2E8F0'}/>
                    <VStack spacing={0} alignItems="flex-start">
                        <Text pt={2} color='#718096'>{label}</Text>
                        <Text>{description}</Text>
                    </VStack>
                </GridItem>
            ))}
        </Grid>
    )
}

export default StepPercent;
