import { Grid, GridItem, Box, VStack, Heading, Text, Container, Flex, SimpleGrid } from '@chakra-ui/react';
import dateFormat, { masks } from "dateformat";

const steps = [
    { label: "25%", description: 1646406000 },
    { label: "50%", description: 1649084400 },
    { label: "70%", description: 1651676400 },
    { label: "100%", description: 1654354800 },
]

function StepPercent(props) {
    return (
        <Grid templateColumns='repeat(4, 1fr)' gap={6} px={10} py="20px">
            {steps.map(({ label, description }, index) => {
                 const date = new Date(description * 1000);
                 const desc = dateFormat(date, "paddedShortDate");
                 return (
                    <GridItem w='100%' h='10' key={index}>
                        <Box w='100%' h='1' bg={(props.percent - 25) > (index * 25) ? '#90CDF4' : '#E2E8F0'}/>
                        <VStack spacing={0} alignItems="flex-start">
                            <Text pt={2} color='#718096'>{label}</Text>
                            <Text>{desc}</Text>
                        </VStack>
                    </GridItem>
                 );
            })}
        </Grid>
    )
}

export default StepPercent;
